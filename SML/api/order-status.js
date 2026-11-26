import {createHash,timingSafeEqual} from "node:crypto";
import {sendJson,requireMethod,supabase,rpc} from "../lib/server.js";

export default async function handler(req,res){
  if(!requireMethod(req,res,"POST"))return;
  const orderNumber=req.body?.orderNumber,token=req.body?.token;
  if(typeof orderNumber!=="string"||!/^SML-[A-F0-9]{10}$/.test(orderNumber)||typeof token!=="string"||!/^[a-f0-9]{64}$/.test(token)){
    sendJson(res,400,{error:"Bestelling niet gevonden."});return;
  }
  try{
    await rpc("expire_transfer_orders",{});
    const tokenHash=createHash("sha256").update(token).digest("hex");
    const rows=await supabase(`orders?select=payment_status,access_token_hash&order_number=eq.${encodeURIComponent(orderNumber)}&limit=1`);
    const order=rows?.[0];
    if(!order){sendJson(res,404,{error:"Bestelling niet gevonden."});return}
    const expected=Buffer.from(order.access_token_hash,"hex"),actual=Buffer.from(tokenHash,"hex");
    if(expected.length!==actual.length||!timingSafeEqual(expected,actual)){sendJson(res,404,{error:"Bestelling niet gevonden."});return}
    sendJson(res,200,{status:order.payment_status});
  }catch(error){
    console.error("Order status request failed",error.status||"unknown");
    sendJson(res,503,{error:"De bestelstatus is tijdelijk niet beschikbaar."});
  }
}
