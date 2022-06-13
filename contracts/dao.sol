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
    address public owner;
    uint256[] public vaidToken;

    struct Proposal {
        uint256 id;
        uint256 voteUp;
        uint256 voteDown;
        uint256 deadline;
        uint256 maxVote;
        string description;
        bool exists;
        bool countConducted;
        // mapping(address => bool) voteStatus;
        address[] canVote;
        bool passed;
    }
    mapping(uint256 => Proposal) public proposals;
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
        require(NFT(nftAddress).balanceOf(msg.sender) > 0, "Not Nft holder");
        _;
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

    function checkVoteEligibilty(uint256 _proposalId, address _voter)
        private
        view
        returns (bool)
    {
        Proposal storage proposal = proposals[_proposalId];
        for (uint256 i = 0; i < proposal.canVote.length; i++) {
            if (proposal.canVote[i] == _voter) {
                return true;
            }
        }
        return false;
    }

    function voteEligibity(uint256 voteId) private view returns (bool) {
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
        newProposal.deadline = block.number + 100;
        newProposal.exists = true;
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

        require(block.number < proposals[id].deadline, "Proposal has expired");
        Proposal storage p = proposals[id];

        if (_vote) {
            p.voteUp++;
        } else {
            p.voteDown++;
        }
        voteStatus[id][msg.sender] = true;
        emit NewVote(p.voteUp, p.voteDown, _vote, id, msg.sender);
    }

    function countVotes(uint256 id) public {
        Proposal storage p = proposals[id];
        require(msg.sender == owner, "Only owner can count the  vote");
        require(block.number > p.deadline, "Proposal has not ended");
        require(!p.countConducted, "Count has already been done");

        if (p.voteUp > p.voteDown) {
            p.passed = true;
        }

        p.countConducted = true;

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
}
