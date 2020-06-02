import React, { FC, useEffect, useState, MutableRefObject } from "react";
import { Signaling } from "../webrtc/signaling";

const TextShare: FC<{ signalingRef: MutableRefObject<Signaling> }> = ({
  signalingRef,
}) => {
  const [text, setText] = useState("");
  useEffect(() => {
    if (signalingRef.current && signalingRef.current.onAddPeers.length === 0) {
      console.log("listen");
      signalingRef.current.onAddPeers.subscribe((peers) => {
        console.log({ peers });
        peers.forEach((peer) => {
          peer.onData.subscribe((raw) => {
            console.log({ raw });
            if (raw.label === "share") setText(raw.data as any);
          });
        });
      });
    }
  });

  return (
    <div>
      <p>datachannel</p>
      <input
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          signalingRef.current.peers.forEach((peer) => {
            peer.send(e.target.value, "share");
          });
        }}
        style={{ width: "40vw" }}
      />
    </div>
  );
};

export default TextShare;
