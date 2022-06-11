// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

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
        mapping(address => bool) voteStatus;
        address[] canVote;
        bool passed;
    }
    mapping(uint256 => Proposal) public proposals;

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

    function checkProposalEligibity(address _proposalist, address nftAddress)
        private
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

    function createProposal(
        string memory _description,
        address[] memory _canVote,
        address nftAddress
    ) public {
        require(
            checkProposalEligibity(msg.sender, nftAddress),
            "Only NFT holder can create proposal"
        );
        proposalId.increment();
        uint256 itemId = proposalId.current();
        Proposal storage newProposal = proposals[itemId];
        newProposal.canVote = _canVote;
        newProposal.description = _description;
        newProposal.deadline = block.number + 100;
        newProposal.exists = true;
        newProposal.maxVote = _canVote.length;
        newProposal.id = itemId;

        emit ProposalCreated(
            itemId,
            _description,
            true,
            _canVote.length,
            msg.sender
        );
    }

    function voteProposal(uint256 id, bool _vote) public {
        require(proposals[id].exists, "Invalid proposal id");
        require(
            checkVoteEligibilty(id, msg.sender),
            "You are not allowed to vote"
        );
        require(
            !proposals[id].voteStatus[msg.sender],
            "You have already voted"
        );
        require(block.number < proposals[id].deadline, "Proposal has expired");
        Proposal storage p = proposals[id];

        if (_vote) {
            p.voteUp++;
        } else {
            p.voteDown++;
        }
        p.voteStatus[msg.sender] = true;
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
}
