const addDataFB = async () =>{
    const response = await fetch('https://goerli-abi.vercel.app' , {
        method : "POST", 
        body : JSON.stringify({
            "address": "0x7c87561b129f46998fc9Afb53F98b7fdaB68696f"
        }),
        //headers : {
        //   'Content-Type' : 'application/json'
        // }
    });
    const data = await response.json();
    console.log(data);  
}


addDataFB()