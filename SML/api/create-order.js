import {createHash,randomBytes} from "node:crypto";
import {sendJson,requireMethod,rpc,bankTransferReady,validCustomer,validItems} from "../lib/server.js";

export default async function handler(req,res){
  if(!requireMethod(req,res,"POST"))return;
  if(!bankTransferReady()){
    sendJson(res,503,{error:"De database of bankrekeninggegevens zijn nog niet ingesteld."});return;
  }
  const customer=req.body?.customer,items=req.body?.items;
  if(!validCustomer(customer)||!validItems(items)){sendJson(res,400,{error:"Controleer je bezorggegevens en winkelmand."});return}
  const token=randomBytes(32).toString("hex");
  const tokenHash=createHash("sha256").update(token).digest("hex");
  try{
    let order=await rpc("create_pending_order",{
      p_customer:{name:customer.name.trim(),email:customer.email.trim(),street:customer.street.trim(),
        postal_code:customer.postal_code.trim(),city:customer.city.trim(),country:customer.country},
      p_items:items.map(item=>({product_id:Number(item.product_id),size:item.size,quantity:Number(item.quantity)})),
      p_access_token_hash:tokenHash
    });
    if(Array.isArray(order))order=order[0];
    if(!order?.order_number||!Number.isInteger(order.total_cents))throw new Error("Order could not be created");
    sendJson(res,201,{
      orderNumber:order.order_number,
      totalCents:order.total_cents,
      expiresAt:order.expires_at,
      token,
      bankAccountName:process.env.BANK_ACCOUNT_NAME,
      iban:process.env.BANK_IBAN.replace(/\s/g,"").toUpperCase(),
      bic:process.env.BANK_BIC||""
    });
  }catch(error){
    const detail=String(error.detail?.message||"");
    if(/rate limit/i.test(detail)){sendJson(res,429,{error:"Er zijn te veel bestellingen achter elkaar geplaatst. Probeer het later opnieuw."});return}
    if(/stock|product unavailable|cart is invalid|item is invalid/i.test(detail)){
      sendJson(res,409,{error:"Een artikel is niet meer beschikbaar. Ververs de collectie en probeer opnieuw."});return;
    }
    console.error("Order creation failed",error.status||"unknown",error.detail?.code||"");
    sendJson(res,503,{error:"De bestelling kon niet worden opgeslagen. Probeer het later opnieuw."});
  }
}
