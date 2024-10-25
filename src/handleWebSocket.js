import { io } from './index.js';
import { getTerminalDetails } from './routes/fetchTerminals.js';
import { updateUserStatus } from './routes/updateTerminal.js';

const handleWebSocket = () => {
    let userRequests = []
    // let tempArray = [];
    let matchingResult = null;



    io.on('connection', (socket) => {
        // console.log('a user connected');

        socket.on('dataFromFrontend', async (data) => {
            // // console.log('Data received from frontend (via Socket.io):', data);
            let connectingLink = data.dial

            if (connectingLink == 'disconnected') {

                // console.log(115, data)

                const adminData = {
                    connectingLink: connectingLink,
                    uniqueId: data.uniqueId
                };

                // console.log(215, data)

                io.emit('message', adminData);
                userRequests = userRequests.filter(item => item.uniqueId !== data.uniqueId);
            }

            if (connectingLink == 'calling') {
                // io.emit('message', adminData);
                // console.log(117, data);
                userRequests.push(data); // Push data into the userRequests array
            }

            if (connectingLink == 'terminal joined') {
                console.log(115, data, 'terminal joined');
                const adminData = {
                    connectingLink: connectingLink,
                    terminal_id: data.terminal_id,
                    uniqueId: data.uniqueId
                };

                io.emit('message', adminData);
            }

            async function connectUserTerminal() {
                console.log("userRequests.length", userRequests.length)

                // Loop through the data array
                if (userRequests.length > 0) {

                    for (let i = 0; i < userRequests.length; i++) {

                        let terminalData = await getTerminalDetails();

                        // console.log(1144, terminalData)

                        terminalData = terminalData.filter(
                            person => person.status === 'active'
                        );

                        // // console.log(1145, terminalData)

                        terminalData.sort((a, b) => new Date(a.event_time) - new Date(b.event_time));

                        // remove terinal ID for few seconds

                        // console.log(32146, userRequests[i])

                        console.log(11377, userRequests);

                        const languagesTranslated = [...new Set(terminalData.flatMap(item => item.languages_known))];

                        // Check if the translateLanguage matches any in languagesToCheck
                        if (userRequests[i] && languagesTranslated.includes(userRequests[i].translateLanguage)) {
                            matchingResult = {
                                translateLanguage: userRequests[i].translateLanguage,
                                uniqueId: userRequests[i].uniqueId
                            };

                            const matchedTerminal = terminalData.find(person => person.languages_known.includes(matchingResult.translateLanguage) && person.status === 'active');

                            // if (matchedTerminal && !tempArray.includes(matchedTerminal.terminal_id)) {
                            if (matchedTerminal) {


                                const meetingData = {
                                    url: matchedTerminal.zoom_url,
                                    uniqueId: matchingResult.uniqueId,
                                    terminal_id: matchedTerminal.terminal_id
                                };

                                // function storeAndRemove(value, delay) {
                                //     // Add the value to the array
                                //     tempArray.push(value);
                                //     console.log("Array after adding:", tempArray);

                                //     // Remove the value after the specified delay (in milliseconds)
                                //     setTimeout(() => {
                                //         // Find the index of the value and remove it
                                //         const index = tempArray.indexOf(value);
                                //         if (index !== -1) {
                                //             tempArray.splice(index, 1);
                                //         }
                                //         console.log("Array after removing:", tempArray);
                                //     }, delay);
                                // }


                                // Example usage: store the value '5' for 3 seconds (3000 milliseconds)
                                // storeAndRemove(matchedTerminal.terminal_id, 5000);

                                // tempArray.push(matchedTerminal.terminal_id)

                                const adminData = {
                                    connectingLink: 'calling',
                                    terminal_id: matchedTerminal.terminal_id,
                                    uniqueId: matchingResult.uniqueId,
                                };

                                // console.log(3177, adminData);

                                io.emit('message', adminData);

                                io.emit('url', meetingData);
                                io.emit('startUrl', meetingData);

                                await updateUserStatus(matchedTerminal.terminal_id, 'inactive')

                                // console.log(1177, userRequests, matchingResult.uniqueId);

                                userRequests = userRequests.filter(item => item.uniqueId !== matchingResult.uniqueId)

                                // console.log(1277, userRequests, matchingResult.uniqueId);
                            }
                            else {
                                matchingResult = "did not find terminal";
                                // console.log(1146, matchingResult)
                            }
                            // clearInterval(intervalId);
                            // df
                            // break; // Exit the loop once a match is found
                        }
                    }
                } else {
                    console.log("no user requests")
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
                        // Schedule the next execution after 1 second
                        setTimeout(executeAllRequests, 5000);
                    }
                };

                // Start the first execution
                executeAllRequests();
            }

        });

    });
    // return "https://zoom.us/j/7193586721?pwd=OUcLui5QIHATeQ0B0JCzl11RbRQVCO.1"
}

// export default router;
export { handleWebSocket };

