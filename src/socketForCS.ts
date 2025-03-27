const setupSocketForCS = (io: any) => {
  io.on("connection", (socket: any) => {
    // Listen for "zoomMessage" event and broadcast it
    socket.on("zoomMessage", async (data: any) => {
      io.emit("streamMessage", data);
    });

    // Listen for "zoomEmoji" event and broadcast it
    socket.on("zoomEmoji", async (data: any) => {
      io.emit("zoomStreamEmoji", data);
    });
  });
};

export default setupSocketForCS;
