const axios = require('axios').default;
const moment = require('moment');

const DISTRICT_ID = 294; // BBMP
// const DISTRICT_ID = 170; // Gujarat

const fetchInformation = async (date_start) => {
    const json_result = await axios.get(
      `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${DISTRICT_ID}&date=${date_start}`
    );
    const { data: { centers = []}} = json_result;
    if(centers && centers.length > 0) {
        const availableCenters = [];
        centers.map(center => {
            if(center && center.sessions && center.sessions.length > 0) {
                const { sessions = [] } = center;
                const availableSessions = sessions.filter((session) => session.min_age_limit === 18 && session.available_capacity > 0);
                if(availableSessions.length > 0) {
                    availableSessions.center_id = center.center_id;
                    availableSessions.name = center.name;
                    console.log("🚀 ~ file: index.js ~ line 16 ~ fetchInformation ~ availableSessions", availableSessions);
                    availableCenters.push(center);
                }
            }
        })
        // console.log("🚀 ~ file: index.js ~ line 11 ~ fetchInformation ~ centers", centers)
    }
    
};

const fetchAvailableSessionsForNext10Days = async () => {
    let [month, date, year] = new Date().toLocaleDateString("en-US").split("/");
    const strMonth = parseInt(month) < 10 ? `0${month}` : `${month}`;

    for (let todaysDate = parseInt(date); todaysDate < parseInt(date) + 10; todaysDate++) {
       const strDate = todaysDate < 10 ? `0${todaysDate}` : `${todaysDate}`;
       const fetchForDate = `${strDate}-${strMonth}-${year}`;
       console.log("🚀 ~ file: index.js ~ line 33 ~ fetchAvailableSessionsForNext10Days ~ fetchForDate", fetchForDate)
       await fetchInformation(fetchForDate);
    }
};

fetchAvailableSessionsForNext10Days();