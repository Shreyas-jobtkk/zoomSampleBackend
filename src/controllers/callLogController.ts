import { Request, Response } from "express";
import * as callLogModel from "../models/callLogModel";
import { CallLogData } from "../types/callLogTypes";

export const createCallLog = async (req: Request, res: Response) => {
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

export const getCallLogData = async (req: Request, res: Response) => {
  try {
    const callLogData = await callLogModel.getCallLogData();
    res.status(200).json(callLogData);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
