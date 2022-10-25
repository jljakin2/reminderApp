import { formatJSONResponse } from "@libs/apiGateway";
import { APIGatewayProxyEvent } from "aws-lambda";
import { v4 as uuid } from "uuid";
import { dynamo } from "@libs/dynamo";

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    const body = JSON.parse(event.body);
    const tableName = process.env.reminderTable;
    const { email, phoneNumber, reminder, reminderDate } = body;

    const validationErrors = validateInputs({
      email,
      phoneNumber,
      reminder,
      reminderDate,
    });
    if (validationErrors) {
      return validationErrors;
    }

    const userId = email || phoneNumber;

    // pk and sk need to be strings.
    // ==============================
    // also, spreading the body into the beginning of the data ensures that if for some reason the user passes
    // pk or sk into the body, our explicit definition will override it.
    const data = {
      ...body,
      id: uuid(),
      TTL: reminderDate / 1000,
      pk: userId,
      sk: reminderDate.toString(),
    };

    await dynamo.write(data, tableName);

    return formatJSONResponse({
      data: {
        message: `reminder is set for ${new Date(reminderDate).toDateString()}`,
        id: data.id,
      },
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

const validateInputs = ({
  email,
  phoneNumber,
  reminder,
  reminderDate,
}: {
  email?: string;
  phoneNumber?: string;
  reminder: string;
  reminderDate: number;
}) => {
  if (!email && !phoneNumber) {
    return formatJSONResponse({
      statusCode: 400,
      data: {
        message: "email or phone number required to create a reminder",
      },
    });
  }
  if (!reminder) {
    return formatJSONResponse({
      statusCode: 400,
      data: {
        message: "reminder required to create a reminder",
      },
    });
  }
  if (!reminderDate) {
    return formatJSONResponse({
      statusCode: 400,
      data: {
        message: "reminder date required to create a reminder",
      },
    });
  }

  return;
};
