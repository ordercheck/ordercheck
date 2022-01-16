module.exports = {
  apps: [{
    name: 'ordercheck',
    script: './server.js',
    instances: 0,
    exec_mode: 'cluster',
    env: {
      "NODE_ENV": "development" // 개발환경시 적용될 설정 지정
    },
    env_production: {
        "NODE_ENV": "production" // 배포환경시 적용될 설정 지정
    }
  }]
}