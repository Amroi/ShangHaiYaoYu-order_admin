import ajax from './ajax';

export const  getBatchId = async(count)=> {
  const resp = await ajax({url:"/erp/id/list?count="+count, method:"GET"});
  return resp.data;
}
 export const  getId = async ()=> {
    const resp = await ajax({url:"/erp/id", method:"GET"});
    return resp.id;
 }