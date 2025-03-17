import { Request, Response } from "express";
import * as callLogModel from "../models/callLogModel";
import { CallLogData } from "../types/callLogTypes";

export const createCallLogController = async (req: Request, res: Response) => {
  // // console.log(158, req.body);
  const {
    interpreter_no,
    languages_support_no,
    contract_no,
    call_dial,
    call_canceled,
    call_start,
    call_end,
    call_status,
    feed_back,
  }: CallLogData = req.body;

  try {
    const callLog = await callLogModel.createCallLog({
      interpreter_no,
      languages_support_no,
      contract_no,
      call_dial,
      call_canceled,
      call_start,
      call_end,
      call_status,
      feed_back,
    });

    res.status(201).json(callLog);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getCallLogsController = async (req: Request, res: Response) => {
  console.log(7777, req.query);
  // Destructuring query parameters with fallback values
  const {
    page,
    limit,
    contract_no,
    interpreter_no,
    lang_no,
    start_time,
    end_time,
    call_status,
  } = req.query;

  // Ensure page and limit are valid numbers
  const pageNumber = isNaN(Number(page)) ? 1 : Number(page);
  const limitNumber = isNaN(Number(limit)) ? 10 : Number(limit);
  const contractNo = contract_no ? Number(contract_no) : "";
  const interpreterNo = interpreter_no ? Number(interpreter_no) : "";
  const langNo = typeof lang_no === "string" ? lang_no : "";
  const startTime: Date | string =
    typeof start_time === "string" ? new Date(start_time) : "";
  const endTime: Date | string =
    typeof end_time === "string" ? new Date(end_time) : "";
  const callStatus = typeof call_status === "string" ? call_status : "";

  try {
    const callLogs = await callLogModel.getAllCallLogs(
      pageNumber,
      limitNumber,
      contractNo,
      interpreterNo,
      langNo,
      startTime,
      endTime,
      callStatus
    );

    res.status(200).json(callLogs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
