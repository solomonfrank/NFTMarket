import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CreateNFT from "./pages/CreateNft";
import CreateProposal from "./pages/CreateProposal";
import NFTDetail from "./pages/ViewNft";

import "antd/dist/antd.css";
import MyNFT from "./pages/MyNFT";
import CreatorNFT from "./pages/Creator";
import Proposal from "./pages/Proposal";

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route exact path="/create" element={<CreateNFT />} />
        <Route exact path="/creator-asset" element={<CreatorNFT />} />
        <Route exact path="/user-asset" element={<MyNFT />} />
        <Route exact path="/asset/:id" element={<NFTDetail />} />
        <Route exact path="/proposal/create" element={<CreateProposal />} />
        <Route exact path="/proposal/:id" element={<Proposal />} />
      </Routes>
    </Router>
  );
}

export default App;
