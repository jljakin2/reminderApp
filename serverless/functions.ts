import type { AWS } from "@serverless/typescript";

const functions: AWS["functions"] = {
  setReminder: {
    handler: "src/functions/setReminder/index.handler",
    events: [
      {
        httpApi: {
          path: "/",
          method: "post",
        },
      },
    ],
  },
  sendReminder: {
    handler: "src/functions/sendReminder/index.handler",
    events: [
      {
        stream: {
          type: "dynamodb",
          arn: {
            "Fn::GetAtt": ["reminderTable", "StreamArn"],
          },
          filterPatterns: [{ eventName: ["REMOVE"] }], // tells lambda to only give you certain events
        },
      },
    ],
    // @ts-expect-error
    iamRoleStatements: [
      { Effect: "Allow", Action: ["ses:sendEmail"], Resource: "*" },
    ],
  },
  getReminders: {
    handler: "src/functions/getReminders/index.handler",
    events: [
      {
        httpApi: {
          path: "/{userId",
          method: "get",
        },
      },
    ],
  },
};

export default functions;
