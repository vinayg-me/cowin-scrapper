const axios = require("axios").default;
const moment = require("moment");
require("dotenv").config({ path: __dirname + "/.env" });
console.log("District Id in env", process.env.DISTRICT_ID);
// const DISTRICT_ID = 294; // BBMP
// const DISTRICT_ID = 170; // Gujarat
// const DISTRICT_ID = 503; // Kota, Rajasthan
const availableCenters = [];

const notifyTelegramBot = async (availableCenters = []) => {
  const text = JSON.stringify(availableCenters);
  let textToSend = "";
  if (availableCenters && availableCenters.length > 0) {
    availableCenters.map((center) => {
      textToSend = textToSend + `Hi, Following centers have a slot:\nName:${center.name}\nPincode:${center.pincode}\nBlock: ${center.blockName}\nDate: ${center.date}\nAvailable Capacity: ${center.available_capacity}\n`;
    });
  }
  const encodedText = encodeURI(textToSend);
  try {
    const teleApiResult = await axios.post(
      `https://api.telegram.org/bot${process.env.TELE_TOKEN}/sendMessage?chat_id=${process.env.CHAT_ID}&text=${encodedText}`
    );
  } catch (error) {
    console.error('The API errored out while notifying the bot')
  }
  
};

const fetchInformation = async (date_start) => {
  const json_result = await axios.get(
    `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${process.env.DISTRICT_ID}&date=${date_start}`
  );
  const {
    data: { centers = [] },
  } = json_result;
  if (centers && centers.length > 0) {
    centers.map((center) => {
      if (center && center.sessions && center.sessions.length > 0) {
        const { sessions = [] } = center;
        const availableSessions = sessions.filter(
          (session) =>
            session.min_age_limit === 18 && session.available_capacity > 0
        );
        if (availableSessions.length > 0) {
          availableSessions.map((session) => {
            session.center_id = center.center_id;
            session.name = center.name;
            session.blockName = center.block_name;
            session.pincode = center.pincode;
            availableCenters.push(session);
          });
        }
      }
    });
    if (availableCenters.length > 0) {
      notifyTelegramBot(availableCenters);
    }
  }
};

const fetchAvailableSessionsForNext10Days = async () => {
  for (let count = 0; count < 10; count++) {
    const curDate = moment().add(count, "day").format("DD-MM-YYYY");
    await fetchInformation(curDate);
  }
};

fetchAvailableSessionsForNext10Days();
