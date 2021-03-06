const db = require("../model/db");
module.exports = {
  inputPlanInfo: async (req, res, next) => {
    await db.planInfo.create({
      plan: "프리",
      monthPrice: 0,
      yearPrice: 0,
      monthWhiteLabelPrice: 0,
      yearWhiteLabelPrice: 0,
      monthAnalyticsPrice: 0,
      yearAnalyticsPrice: 0,
      monthChatPrice: 0,
      yearChatPrice: 0,
      isCreateCompany: false,
      isManageMember: false,
      isInviteMember: false,
      isFileStorage: false,
      isAutoChargeMessage: true,
      maxConsultingForm: 3,
      maxAddCustomer: 10,
      maxFormCount: 1,
      maxFileStorageSize: 0,
      monthResultPrice: 0,
      yearResultPrice: 0,
    });

    await db.planInfo.create({
      plan: "스타터",
      monthPrice: 43000,
      yearPrice: 38000,
      monthWhiteLabelPrice: 0,
      yearWhiteLabelPrice: 0,
      monthAnalyticsPrice: 21500,
      yearAnalyticsPrice: 19000,
      monthChatPrice: 21500,
      yearChatPrice: 19000,
      isCreateCompany: true,
      isManageMember: true,
      isInviteMember: true,
      isFileStorage: true,
      isAutoChargeMessage: true,
      maxConsultingForm: 40,
      maxAddCustomer: 45,
      maxFormCount: 99999,
      maxFileStorageSize: 536870912000,
      monthResultPrice: 43000,
      yearResultPrice: 38000 * 12,
    });
    await db.planInfo.create({
      plan: "프로",
      monthPrice: 75800,
      yearPrice: 68000,
      monthWhiteLabelPrice: 0,
      yearWhiteLabelPrice: 0,
      monthAnalyticsPrice: 60700,
      yearAnalyticsPrice: 54000,
      monthChatPrice: 60700,
      yearChatPrice: 54000,
      isCreateCompany: true,
      isManageMember: true,
      isInviteMember: true,
      isFileStorage: true,
      isAutoChargeMessage: true,
      maxConsultingForm: 100,
      maxAddCustomer: 113,
      maxFormCount: 99999,
      maxFileStorageSize: 1099511627776,
      monthResultPrice: 75800,
      yearResultPrice: 68000 * 12,
    });

    await db.planInfo.create({
      plan: "팀",
      monthPrice: 125300,
      yearPrice: 112000,
      monthWhiteLabelPrice: 150400,
      yearWhiteLabelPrice: 135000,
      monthAnalyticsPrice: 150400,
      yearAnalyticsPrice: 135000,
      monthChatPrice: 150400,
      yearChatPrice: 135000,
      isCreateCompany: true,
      isManageMember: true,
      isInviteMember: true,
      isFileStorage: true,
      isAutoChargeMessage: true,
      maxConsultingForm: 205,
      maxAddCustomer: 225,
      maxFormCount: 99999,
      maxFileStorageSize: 1649267441664,
      monthResultPrice: 125300,
      yearResultPrice: 112000 * 12,
    });
    await db.planInfo.create({
      plan: "컴퍼니",
      monthPrice: 227200,
      yearPrice: 204000,
      monthWhiteLabelPrice: 454300,
      yearWhiteLabelPrice: 408000,
      monthAnalyticsPrice: 340700,
      yearAnalyticsPrice: 306000,
      monthChatPrice: 340700,
      yearChatPrice: 306000,
      isCreateCompany: true,
      isManageMember: true,
      isInviteMember: true,
      isFileStorage: true,
      isAutoChargeMessage: true,
      maxConsultingForm: 410,
      maxAddCustomer: 450,
      maxFormCount: 99999,
      maxFileStorageSize: 2199023255552,
      monthResultPrice: 227200,
      yearResultPrice: 204000 * 12,
    });
  },
};
