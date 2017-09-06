const client = require('mongodb').MongoClient();
const configs = require('./configs.json');
let rmq = require('amqplib');

/** function to connect to mongodb **/
connectDB = () => {
    return new Promise((resolve, reject) => {
        client.connect(configs.mongodb_uri, (err, database) => {
        if(err) {console.log("Connected to mongodb server failed"); reject(err);}
        else {console.log("Connected to mongodb server"); resolve(database);}
        });
    });
};

/** function to connect to rabbit mq **/
connectMQ = () => {
	return new Promise(async(resolve, reject) => {
		try {
			let connection = await rmq.connect(configs.rabbitmq_uri);
			console.log("connected to rmq!");
			resolve(connection);
		}catch (err){
			console.log(err);
			reject(err);
		}
	});
};


/** function to get gps tracker test **/
getGpsTests = (database) => {
	return new Promise( async(resolve, reject) => {
		let trackerCollection = database.collection('tb_tracker');
		try{
			let query = 				
			{ $and:
                [
                    { AppID: 0 }
                    {"location.coordinates": {$ne: [0,0] }}
                ] 
			};
		}catch(err){
			reject(err);
		}
	});
};



connectDB().then(dbConnection =>{
	return connectMQ();
}).then(mqConnection =>{
	
}).catch(err => {
	console.log(err);
});





