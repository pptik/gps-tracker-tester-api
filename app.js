const client = require('mongodb').MongoClient();
const configs = require('./configs.json');
let rmq = require('amqplib');
let database;

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
                    { AppID: 0 },
                    {"location.coordinates": {$ne: [0,0] }}
                ] 
			};
			let result = await trackerCollection.find(query).toArray();
			resolve(result)
		}catch(err){
			reject(err);
		}
	});
};



/** function to broadcast gps test **/
broadcast = async(connection, db) => {
	try{
		let ch = await connection.createChannel();
		await ch.assertExchange("gps.tester", 'topic', {durable: false});
		let q = await ch.assertQueue("GPS-TESTER-BROADCASTER", {exclusive: false, messageTtl: 1000});
		await ch.bindQueue(q.queue, "gps.tester", "GPS-TESTER-BROADCASTER");
		console.log("starting broadcast via gps.tester.broadcast");
		setInterval(async function () {
            let dataGpsTracker = await getGpsTests(db);
            console.log(dataGpsTracker);
            let msg = JSON.stringify(dataGpsTracker);
            await ch.publish("gps.tester", "gps.tester.broadcast", new Buffer(msg));
        }, 1500);
	}catch(err){
		console.log(err);
	}
};



connectDB().then(dbConnection =>{
	database = dbConnection;
	return connectMQ();
}).then(mqConnection =>{
	broadcast(mqConnection, database);
}).catch(err => {
	console.log(err);
});





