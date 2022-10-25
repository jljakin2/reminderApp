import { formatJSONResponse } from "@libs/apiGateway";
import { APIGatewayProxyEvent } from "aws-lambda";
import { v4 as uuid } from "uuid";
import { dynamo } from "@libs/dynamo";

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    const tableName = process.env.reminderTable;
    const { userId } = event.pathParameters || {};

    if (!userId) {
      return formatJSONResponse({
        statusCode: 400,
        data: { message: "missing userId in path" },
      });
    }

    const data = await dynamo.query({
      tableName,
      index: "index1",
      pkValue: userId,
    });

    return formatJSONResponse({
      data,
    });
  } catch (error) {
    console.log("error", error);
    return formatJSONResponse({
      statusCode: 502,
      data: {
        message: error.message,
      },
    });
  }
};
