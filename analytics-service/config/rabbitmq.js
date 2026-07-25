import amqp from "amqplib";

let channel;

export const connectRabbitMQ=async()=>{

    const connection=await amqp.connect(process.env.RABBITMQ_URL);

    channel=await connection.createChannel();

    await channel.assertQueue(process.env.QUEUE_NAME,{
        durable:true
    });

};

export const getChannel=()=>channel;

export const getQueueName=()=>process.env.QUEUE_NAME;