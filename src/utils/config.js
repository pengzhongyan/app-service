const path = require("path");

module.exports = {
    baseUrl: "/wec-devops-superapp",
    pathYaml: "public/wec-devops-superapp.yaml",
    pathApi: path.resolve(__dirname, "../api/api.js"),
    pathService: path.resolve(__dirname, "../api/service.js")
};
