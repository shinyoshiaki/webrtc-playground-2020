import socketClient from "socket.io-client";
import WebRTC from "webrtc4me";
import Event from "rx.mini";

const url = "localhost:80";

export const socket = socketClient(url, { transports: ["websocket"] });

export function listenPeer(trickle: boolean, stun: boolean) {
  const event = new Event<WebRTC>();
  socket.on("join", async (join: { id: string }) => {
    console.log("join");
    const rtc = new WebRTC({ trickle, disable_stun: !stun });
    socket.on("sdp", (data: { sdp: any; id: string }) => {
      console.log("sdp", data, join);
      if (data.id === join.id) {
        console.log("set sdp");
        rtc.setSdp(data.sdp);
      }
    });
    rtc.onSignal.subscribe((sdp) => {
      console.log("emit sdp");
      socket.emit("sdp", { sdp, target: join.id });
    });
    await rtc.onConnect.asPromise();
    event.execute(rtc);
  });
  return event;
}

export function join(roomId: string, trickle: boolean, stun: boolean) {
  return new Promise<WebRTC[] | undefined>(async (resolve) => {
    socket.emit("join", { roomId });
    const guests = await new Promise<string[]>((r) => {
      socket.on("join", (v: { guests: string[] }) => {
        r(v.guests);
      });
    });

    if (!guests) {
      resolve();
      return;
    }

    const peers = await Promise.all(
      guests.map(async (id) => {
        const rtc = new WebRTC({ nodeId: id, trickle, disable_stun: !stun });
        rtc.onData.subscribe((message) => {
          console.log({ message });
        });
        socket.on("sdp", (data: { sdp: any; id: string }) => {
          if (data.id === id) rtc.setSdp(data.sdp);
        });
        rtc.makeOffer();

        const onSignal = rtc.onSignal.subscribe((sdp) => {
          socket.emit("sdp", { sdp, target: id });
        });
        await rtc.onConnect.asPromise();
        console.log("connect");
        onSignal.unSubscribe();
        return rtc;
      })
    );
    resolve(peers);
  });
}
