// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import "hardhat/console.sol";
import "./NFT.sol";

contract MyDao {
    using Counters for Counters.Counter;

    Counters.Counter private proposalId;
    Counters.Counter private countedVoteId;

    address public owner;
    uint256[] public vaidToken;

    struct VotedAddress {
        address voter;
        bool status;
    }

    struct Proposal {
        uint256 id;
        uint256 voteUp;
        uint256 voteDown;
        uint256 deadline;
        uint256 maxVote;
        string description;
        bool exists;
        bool countConducted;
        VotedAddress[] canVote;
        address owner;
        bool passed;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => uint256) public countConductedIds;
    mapping(uint256 => mapping(address => bool)) public voteStatus;
    mapping(uint256 => mapping(uint256 => bool)) public votedNftId;

    event ProposalCreated(
        uint256 id,
        string description,
        bool exists,
        uint256 maxVote,
        address proposer
    );

    event NewVote(
        uint256 voteUp,
        uint256 voteDown,
        bool votedFor,
        uint256 proposal,
        address voter
    );

    event ProposalCount(uint256 id, bool passed);

    modifier nftHolder(address nftAddress) {
        console.log("nftAddress", nftAddress);
        uint256 amount = NFT(nftAddress).balanceOf(msg.sender);
        console.log("amount", amount);
        require(NFT(nftAddress).balanceOf(msg.sender) > 0, "Not Nft holder");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function checkProposalEligibity(address _proposalist, address nftAddress)
        private
        view
        returns (bool)
    {
        for (uint256 i = 0; i < vaidToken.length; i++) {
            uint256 balance = IERC721(nftAddress).balanceOf(
                _proposalist
                // vaidToken[i]
            );
            if (balance >= 1) {
                return true;
            }
        }
        return false;
    }

    // function checkVoteEligibilty(uint256 _proposalId, address _voter)
    //     private
    //     view
    //     returns (bool)
    // {
    //     Proposal storage proposal = proposals[_proposalId];
    //     for (uint256 i = 0; i < proposal.canVote.length; i++) {
    //         if (proposal.canVote[i] == _voter) {
    //             return true;
    //         }
    //     }
    //     return false;
    // }

    function voteEligibity(uint256 voteId, address nftAddress)
        private
        returns (uint256)
    {
        uint256 balance = NFT(nftAddress).balanceOf(msg.sender);
        uint256 availableVote;

        for (uint256 i; i < balance; i++) {
            uint256 tokenId = NFT(nftAddress).tokenOfOwnerByIndex(
                msg.sender,
                i
            );
            if (votedNftId[voteId][tokenId] == false) {
                availableVote++;
                votedNftId[voteId][tokenId] = true;
            }
        }

        return availableVote;
    }

    function createProposal(string memory _description, address nftAddress)
        public
        nftHolder(nftAddress)
    {
        // require(
        //     checkProposalEligibity(msg.sender, nftAddress),
        //     "Only NFT holder can create proposal"
        // );
        console.log("proposal", _description, nftAddress);
        proposalId.increment();

        uint256 itemId = proposalId.current();
        Proposal storage newProposal = proposals[itemId];
        newProposal.description = _description;
        newProposal.deadline = block.timestamp + 10 minutes;
        newProposal.exists = true;
        newProposal.owner = msg.sender;
        newProposal.id = itemId;

        emit ProposalCreated(
            itemId,
            _description,
            true,
            newProposal.canVote.length,
            msg.sender
        );
    }

    function voteProposal(
        uint256 id,
        bool _vote,
        address nftAddress
    ) public nftHolder(nftAddress) {
        require(proposals[id].exists, "Invalid proposal id");
        require(!voteStatus[id][msg.sender], "You have already voted");
        require(
            voteEligibity(id, nftAddress) > 0,
            "You are not allowed to vote"
        );

        require(
            proposals[id].deadline > block.timestamp,
            "Proposal has expired"
        );
        Proposal storage p = proposals[id];

        if (_vote) {
            p.voteUp++;
        } else {
            p.voteDown++;
        }

        p.canVote.push(VotedAddress(msg.sender, _vote));

        voteStatus[id][msg.sender] = true;
        emit NewVote(p.voteUp, p.voteDown, _vote, id, msg.sender);
    }

    function countVotes(uint256 id, address nftAddress)
        public
        nftHolder(nftAddress)
    {
        Proposal storage p = proposals[id];
        require(p.owner == msg.sender, "Only can count vote.");
        require(block.timestamp > p.deadline, "Proposal has not ended");
        require(!p.countConducted, "Count has already been done");

        if (p.voteUp > p.voteDown) {
            p.passed = true;
        }

        p.countConducted = true;
        countedVoteId.increment();
        uint256 countId = countedVoteId.current();
        countConductedIds[id] = countId;

        emit ProposalCount(id, p.countConducted);
    }

    function addTokenId(uint256 id) public {
        require(msg.sender == owner, "You are not authorized");
        vaidToken.push(id);
    }

    function fetchProposal() public view returns (Proposal[] memory) {
        uint256 proposalCount = proposalId.current();
        uint256 currentIdx = 0;
        Proposal[] memory items = new Proposal[](proposalCount);
        for (uint256 i = 0; i < proposalCount; i++) {
            Proposal storage currentItem = proposals[i + 1];
            items[currentIdx] = currentItem;
            currentIdx += 1;
        }
        return items;
    }

    function fetchProposalItem(uint256 id)
        public
        view
        returns (Proposal memory)
    {
        return proposals[id];
    }

    function fetchOngoingProposals() public view returns (Proposal[] memory) {
        uint256 proposalCount = proposalId.current();
        uint256 countConducted = countedVoteId.current();

        uint256 notCountConducted = proposalCount - countConducted;
        uint256 currenrIdx = 0;
        Proposal[] memory proposalUnConductd = new Proposal[](
            notCountConducted
        );

        for (uint256 i; i < proposalCount; ) {
            Proposal memory p = proposals[i + 1];

            if (p.countConducted == false) {
                proposalUnConductd[currenrIdx] = p;
            }

            unchecked {
                i++;
                currenrIdx++;
            }
        }
        return proposalUnConductd;
    }
}
