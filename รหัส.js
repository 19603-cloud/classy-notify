function doPost(e) {

  if (!e || !e.postData) {
    return ContentService.createTextOutput("No Data");
  }

  var data = JSON.parse(e.postData.contents);
  var event = data.events[0];

  if (event.type !== "message" || event.message.type !== "text") {
    return ContentService.createTextOutput("OK");
  }

  var replyToken = event.replyToken;
  var userMessage = event.message.text;

  if (userMessage.includes("งาน") || userMessage.includes("การบ้าน")) {

    var courses = Classroom.Courses.list().courses;
    var message = "📚 การบ้านล่าสุด 5 รายการ\n\n";
    var count = 0;

    if (courses) {

      for (var i = 0; i < courses.length; i++) {

        var works = Classroom.Courses.CourseWork.list(courses[i].id).courseWork;

        if (works) {

          for (var j = 0; j < works.length; j++) {

            var dueDate = "-";

            if (works[j].dueDate) {
              var d = works[j].dueDate;
              dueDate = d.day + "/" + d.month + "/" + d.year;
            }

            message += "📖 วิชา: " + courses[i].name + "\n";
            message += "📝 งาน: " + works[j].title + "\n";
            message += "📅 กำหนดส่ง: " + dueDate + "\n";

            // 🔥 ดึงรายชื่อคนที่ยังไม่ส่ง
            var submissions = Classroom.Courses.CourseWork.StudentSubmissions.list(
              courses[i].id,
              works[j].id
            ).studentSubmissions;

            var notSubmitted = [];

            if (submissions) {
              for (var k = 0; k < submissions.length; k++) {
                if (submissions[k].state !== "TURNED_IN") {
                  var student = Classroom.Courses.Students.get(
                    courses[i].id,
                    submissions[k].userId
                  );
                  notSubmitted.push(student.profile.name.fullName);
                }
              }
            }

            if (notSubmitted.length > 0) {
              message += "❌ ยังไม่ส่ง:\n";
              for (var n = 0; n < notSubmitted.length; n++) {
                message += "- " + notSubmitted[n] + "\n";
              }
            } else {
              message += "✅ ส่งครบทุกคน\n";
            }

            message += "\n-------------------\n\n";

            count++;
            if (count >= 5) break;
          }
        }

        if (count >= 5) break;
      }
    }

    if (count === 0) {
      message += "ไม่พบการบ้านในขณะนี้";
    }

    replyMessage(replyToken, message);

  } else {
    replyMessage(replyToken, "พิมพ์คำว่า 'งาน' หรือ 'การบ้าน' เพื่อดูงานล่าสุด 📚");
  }

  return ContentService.createTextOutput("OK");
}



function replyMessage(replyToken, text) {

  var token = "ksA6UixggR55vykd2/WU2MLC5mOvhnswOkuMezssqkj38SEDsBE/3s3PjY553HKTVEx0t4kiwFwrVkWhtL/qS4edZ++ppO6dFYDOUc9uCPOcjUlV4DNDR3u6f/049eV6xY/Lk83XhLnEg92xRiSu3gdB04t89/1O/w1cDnyilFU=";

  var url = "https://api.line.me/v2/bot/message/reply";

  var payload = {
    replyToken: replyToken,
    messages: [{
      type: "text",
      text: text
    }]
  };

  var options = {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    payload: JSON.stringify(payload)
  };

  UrlFetchApp.fetch(url, options);
}