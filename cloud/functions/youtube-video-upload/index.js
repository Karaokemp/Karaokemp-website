const MSG = "HELLO! This is DreckGuy !!! Created this short code on local workstation"
exports.handler = async (event)=>{
  return new Promise((resolve,reject)=>{
    reject("Test Error!")
      //resolve(MSG)
    })
}