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


/*connectMQ().then(mqConnection => {
	return connectDB();
}).then(dbConnection =>{
	
}).catch(err => {
	console.log(err);
}); */

connectDB().then(dbConnection =>{
	return connectMQ();
}).then(mqConnection =>{
	
}).catch(err => {
	console.log(err);
});





