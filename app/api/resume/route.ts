export async function POST(req: Request) {
  try {
    const { fileUrl } = await req.json();

    const response = await fetch(
      "https://resume-parsing-api2.p.rapidapi.com/processDocument",
      {
        method: "POST",
        headers: {
          "x-rapidapi-key": process.env.RAPIDAPI_KEY!,
          "x-rapidapi-host":
            "resume-parsing-api2.p.rapidapi.com",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          extractionDetails: {
            name: "Resume Extraction",
            language: "English",
            fields: [
              {
                key: "personal_info",
                description: "personal info",
                type: "object",
                properties: [
                  {
                    key: "name",
                    description: "name",
                    type: "string",
                  },
                  {
                    key: "email",
                    description: "email",
                    type: "string",
                  },
                ],
              },
              {
                key: "skills",
                description: "skills",
                type: "array",
                items: {
                  type: "string",
                },
              },
            ],
          },
          file: fileUrl,
        }),
      }
    );

    const data = await response.json();

    return Response.json(data);
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Resume API failed" },
      { status: 500 }
    );
  }
}