import React, { useState, useRef, FC } from "react";
import { join, listenPeer } from "./webrtc/signaling";
import WebRTC, { getLocalVideo } from "webrtc4me";
import Event from "rx.mini";
import Videos from "./components/videos";
import useInput from "./hooks/useInput";
import SFU from "./SFU";

const App: FC = () => {
  const [roomId, setRoomId, clear] = useInput();
  const [roomLabel, setRoomLabel] = useState("");
  const [rtcList, setRTCList] = useState<{ [id: string]: WebRTC }>({});
  const mediaEvent = useRef({ stream: new Event<MediaStream[]>() });
  const localStreamRef = useRef<MediaStream>(null);

  const joinRoom = async () => {
    setRoomLabel("join room:" + roomId);
    localStreamRef.current = await getLocalVideo({ width: 320, height: 180 });
    mediaEvent.current.stream.execute([localStreamRef.current]);
    const peers = await join(roomId, true, true);
    if (peers) {
      setRTCList(
        peers.reduce((acc, cur) => {
          acc[cur.nodeId] = cur;
          return acc;
        }, {})
      );
      const streams = await Promise.all(
        peers.map(async (peer) => {
          return await setupStream(peer);
        })
      );
      mediaEvent.current.stream.execute(streams);
    }

    listenPeer(true, true).subscribe(async (peer) => {
      const stream = await setupStream(peer);
      mediaEvent.current.stream.execute([stream]);
    });

    clear();
  };

  const setupStream = (peer: WebRTC) =>
    new Promise<MediaStream>(async (r) => {
      peer.onAddTrack.subscribe(async (stream) => {
        r(stream);
        if (!peer.isOffer) {
          peer.addStream(localStreamRef.current);
        }
      });

      if (peer.isOffer) {
        peer.addStream(localStreamRef.current);
      }
    });

  return (
    <div>
      <p>sfu</p>
      <SFU />
      <p>mesh</p>
      <input onChange={setRoomId} placeholder="roomId" value={roomId} />
      <button onClick={joinRoom}>join</button>
      <br />
      <p>{roomLabel}</p>
      <Videos streamEvent={mediaEvent.current.stream} />
    </div>
  );
};

export default App;
