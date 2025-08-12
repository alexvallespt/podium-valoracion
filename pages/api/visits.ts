import type { NextApiRequest, NextApiResponse } from "next";
import { getStore } from "../../lib/store";

export default function handler(req:NextApiRequest,res:NextApiResponse){
  try{
    const store = getStore();
    const list = Object.values(store.visits).sort((a,b)=> (a.createdAt<b.createdAt?1:-1));
    res.status(200).json({ ok:true, visits:list });
  }catch(e:any){
    res.status(500).json({ ok:false, error:e.message });
  }
}
