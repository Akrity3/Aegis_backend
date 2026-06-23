const BASE_URL = "http://localhost:3000/api/v1";

const testUser = {
    firstName: "Aakriti",
    lastName: "Rasaili",
    gender: "Female",
    email: `test_${Date.now()}@example.com`,
    username: `user_${Date.now()}`,
    password: "password123",
};

async function request(
    method: string,
    path: string,
    body?: any,
    token?: string
) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    const data: any = await response.json();
    if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
    }
    return data;
}

async function run() {
    console.log("=== Aegis+ Auth API Test ===\n");

    try {
        console.log("1. Register user...");
        const registerRes = await request("POST", "/users", testUser);
        console.log("   Success:", registerRes.success);
        console.log("   User ID:", registerRes.data._id);

        console.log("\n2. Login user...");
        const loginRes = await request("POST", "/users/login", {
            email: testUser.email,
            password: testUser.password,
        });
        console.log("   Success:", loginRes.success);
        console.log("   Token:", loginRes.token ? "received" : "missing");

        console.log("\n3. Get user by ID (protected)...");
        const profileRes = await request(
            "GET",
            `/users/${loginRes.data._id}`,
            null,
            loginRes.token
        );
        console.log("   Email:", profileRes.data.email);

        console.log("\n4. Upload profile picture (protected)...");
        const formData = new FormData();
        const fileBlob = new Blob([Buffer.from("dummy-image-data")], {
            type: "image/png",
        });
        formData.append("profilePicture", fileBlob, "test-profile.png");

        const uploadResponse = await fetch(
            `${BASE_URL}/users/profile-picture`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${loginRes.token}`,
                },
                body: formData,
            }
        );

        const uploadData: any = await uploadResponse.json();
        if (!uploadResponse.ok) {
            throw new Error(
                uploadData.message || `HTTP ${uploadResponse.status}`
            );
        }
        console.log("   Success:", uploadData.success);
        console.log(
            "   Updated profilePicture:",
            uploadData.data.profilePicture
        );

        console.log("\nAll auth and upload tests passed.");
    } catch (error: any) {
        console.error("\nTest failed:", error.message);
        process.exit(1);
    }
}

run();
