const SUPABASE_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwYWN6dXZ3bHNqc2FvdGFya3JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5OTQ5MjMsImV4cCI6MjA2MTU3MDkyM30.d1M_7Jfdyeow9OMHdUuQoKjxNR5SIhVZx86vkbL-kWs"; 

msg.headers = {
    "Content-Type": "application/json",
    "apikey": SUPABASE_API_KEY,
    "Authorization": "Bearer " + SUPABASE_API_KEY
};

var tempDSValue = msg.payload['uplink_message']['decoded_payload']['tempDS']
var humDHTValue = msg.payload['uplink_message']['decoded_payload']['humDHT']
var windSpeedValue = msg.payload['uplink_message']['decoded_payload']['windSpeed']
var deviceNameValue = 'Heltec Controler';

msg.payload = {
    temperature:tempDSValue,  
    humidity: humDHTValue,
    presure:windSpeedValue,
    // device_name:deviceNameValue,
};

return msg;


