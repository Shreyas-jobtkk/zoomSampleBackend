import { io } from "./index.js";
import { getTerminalDetails } from "./routes/fetchTerminals.js";
import { updateUserStatus } from "./routes/updateTerminal.js";

const handleWebSocket = () => {
  let userRequests = [];
  // let tempArray = [];
  let matchingResult = null;

  io.on("connection", (socket) => {
    // console.log('a user connected');

    socket.on("dataFromFrontend", async (data) => {
      // // console.log('Data received from frontend (via Socket.io):', data);
      let connectingLink = data.dial;
      //  console.log(115, data)

      if (connectingLink == "forcible disconnect") {
        console.log(118, data);

        const adminData = {
          connectingLink: connectingLink,
          uniqueId: data.uniqueId,
        };

        // // console.log(215, data)

        io.emit("message", adminData);
        // userRequests = userRequests.filter(item => item.uniqueId !== data.uniqueId);
      }

      if (connectingLink == "disconnected") {
        // console.log(115, data)

        const adminData = {
          connectingLink: connectingLink,
          uniqueId: data.uniqueId,
        };

        console.log(215, data);

        io.emit("message", adminData);
        userRequests = userRequests.filter(
          (item) => item.uniqueId !== data.uniqueId
        );
      }

      if (connectingLink == "calling") {
        // io.emit('message', adminData);
        // console.log(117, data);
        userRequests.push(data);
        console.log(117, userRequests);
      }

      if (connectingLink == "terminal joined") {
        console.log(115, data, "terminal joined");
        const adminData = {
          connectingLink: connectingLink,
          terminal_id: data.terminal_id,
          uniqueId: data.uniqueId,
        };

        io.emit("message", adminData);
      }

      async function connectUserTerminal() {
        // console.log("userRequests.length", userRequests.length)

        // Loop through the data array
        if (userRequests.length > 0) {
          for (let i = 0; i < userRequests.length; i++) {
            let terminalData = await getTerminalDetails();

            // console.log(1144, terminalData)

            terminalData = terminalData.filter(
              (person) => person.status === "active"
            );

            terminalData.sort(
              (a, b) => new Date(a.event_time) - new Date(b.event_time)
            );

            // console.log(11377, userRequests.length);

            const languagesTranslated = [
              ...new Set(terminalData.flatMap((item) => item.languages_known)),
            ];

            // Check if the translateLanguage matches any in languagesToCheck
            if (
              userRequests[i] &&
              languagesTranslated.includes(userRequests[i].translateLanguage)
            ) {
              matchingResult = {
                translateLanguage: userRequests[i].translateLanguage,
                uniqueId: userRequests[i].uniqueId,
              };

              const matchedTerminal = terminalData.find((person) =>
                person.languages_known.includes(
                  matchingResult.translateLanguage
                )
              );

              // if (matchedTerminal) {

              const meetingData = {
                url: matchedTerminal.zoom_url,
                uniqueId: matchingResult.uniqueId,
                terminal_id: matchedTerminal.terminal_id,
              };

              const adminData = {
                connectingLink: "calling",
                terminal_id: matchedTerminal.terminal_id,
                uniqueId: matchingResult.uniqueId,
              };

              console.log(3177, adminData);

              io.emit("message", adminData);

              io.emit("url", meetingData);
              io.emit("startUrl", meetingData);

              await updateUserStatus(matchedTerminal.terminal_id, "inactive");
              // console.log(2146, userRequests[i].uniqueId, "found the terminal")
            } else {
              const adminData = {
                connectingLink: "no active terminal",
                uniqueId: userRequests[i].uniqueId,
              };

              // console.log(3177, adminData);

              io.emit("message", adminData);
              // console.log(4146, userRequests[i].uniqueId, "no terminal to find")
              // userRequests = userRequests.filter(item => item.uniqueId !== userRequests[i].uniqueId)
            }

            userRequests = userRequests.filter(
              (item) => item.uniqueId !== userRequests[i].uniqueId
            );

            // userRequests[i].uniqueId
          }
        }
      }

      if (userRequests.length > 0) {
        const executeAllRequests = () => {
          // Call the function to connect the user terminal
          connectUserTerminal();

          // Check the length of userRequests after the function execution
          if (userRequests.length === 0) {
            console.log("userRequests.length is zero", userRequests.length);
          } else {
            console.log("userRequests.length is", userRequests.length);
            // Schedule the next execution after 1 second
            setTimeout(executeAllRequests, 5000);
          }
        };

        // Start the first execution
        executeAllRequests();
      }
    });

    socket.on("zoomMessage", async (data) => {
      console.log(15678, data);
      io.emit("streamMessage", data);
    });

    socket.on("zoomEmoji", async (data) => {
      console.log(25678, data);
      io.emit("zoomStreamEmoji", data);
    });
  });
  // return "https://zoom.us/j/7193586721?pwd=OUcLui5QIHATeQ0B0JCzl11RbRQVCO.1"
};

// export default router;
export { handleWebSocket };
