const lab = {
    labId: 45565,
    labName: "Azizul Haque Lab and Diagonosis center",
    email: "sam@yahoo.com",
    primaryContactNumber: 176518,
    secondaryContactNumber: 75787,
    zone: "Bhaluka",
    address: 'Hospital Road, Bhaluka Pourosova',
    admins: [
        { username: 'admin1', email: 'admin1@yahoo.com', refreshTokens: ['token1', 'token2', 'token3'] },
        { username: 'admin2', email: 'admin2@yahoo.com', refreshTokens: ['token1', 'token2', 'token3'] }
    ],
    staffs: [
        { username: 'staff1', email: 'staff1@yahoo.com', refreshTokens: ['token1', 'token2', 'token3'] },
        { username: 'staff2', email: 'staff2@yahoo.com', refreshTokens: ['token1', 'token2', 'token3'] }
    ],
    referrers: [
        { name: 'Referrer1', isDoctor: false, commissionType: 'fixed', commission: 300, contact: 8768798, details: 'qhfdhjgdsjkasjk' },
        { name: 'Referrer2', isDoctor: false, commissionType: 'percentage', commission: 20, contact: 76576768, details: 'sdjfgjkskja' },
        { name: 'Dr. Hasan', isDoctor: true, commissionType: 'percentage', commission: 30, contact: 987987, details: 'jagdadkjas' },
    ],
    testList: [
        { testName: 'CBC', type: 1, price: 300, category: 'Cat-A' },
        { testName: 'RBS', type: 1, price: 200, category: 'Cat-A' },
        { testName: 'XRay', type: 2, price: 400, category: 'Cat-B' },
        { testName: 'ECG', type: 2, price: 150, category: 'Cat-B' },
    ],
    dueAmount: 560,
    loadedAmont: 500,

}