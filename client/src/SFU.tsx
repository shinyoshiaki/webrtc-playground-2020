import React, { FC, useRef, useState } from "react";
import { Client } from "./webrtc/client";
import { socket } from "./webrtc/signaling";
import { getLocalVideo } from "webrtc4me";
import Videos from "./components/videos";
import Event from "rx.mini";
import { socketPromise } from "./webrtc/socket.io-promise";

const SFU: FC = () => {
  const [roomId, setRoomId] = useState("");
  const [roomLabel, setRoomLabel] = useState("");
  const clientRef = useRef<Client>(null);
  const mediaEvent = useRef({ stream: new Event<MediaStream[]>() });

  return (
    <div>
      <div>
        <input
          onChange={(e) => {
            setRoomId(e.target.value);
          }}
        />
        <button
          onClick={async () => {
            setRoomLabel("join room:" + roomId);
            socket.emit("join", { roomId });
            const { create } = await new Promise((r) => socket.on("join", r));
            clientRef.current = new Client(socket);
            clientRef.current.onSubscribe.subscribe((stream) => {
              mediaEvent.current.stream.execute([stream]);
            });
            if (!create) {
              console.log("join");
              const targets = await socketPromise(socket)("transportList");
              let streams = [];
              for (let target of targets) {
                const stream = await clientRef.current.subscribe(target);
                streams.push(stream);
              }
              mediaEvent.current.stream.execute(streams);
            } else {
              console.log("create");
            }
            const stream = await getLocalVideo();
            console.log("localstream");
            await clientRef.current.publish(stream);
            mediaEvent.current.stream.execute([stream]);
          }}
        >
          join
        </button>
      </div>
      <p>{roomLabel}</p>
      <Videos streamEvent={mediaEvent.current.stream} />
    </div>
  );
};

export default SFU;
