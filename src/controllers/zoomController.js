import { createMeeting } from "../models/zoomModel.js";

// Controller to handle meeting creation request
export async function createMeetingController(req, res) {
  try {
    const meeting = await createMeeting();
    res.status(200).json({ success: true, meeting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
