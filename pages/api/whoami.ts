import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req:NextApiRequest, res:NextApiResponse){
  const cookie = req.headers.cookie || "";
  const staff = /(^|; )staff=1(;|$)/.test(cookie);
  res.status(200).json({ ok:true, staff });
}
