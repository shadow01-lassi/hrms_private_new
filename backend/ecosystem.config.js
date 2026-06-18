module.exports = {
    apps: [
        {
            name: "society",
            script: "dist/server.js",
            instances: 2,
            exec_mode: "cluster",
            max_memory_restart: "350M",
            node_args: "--max-old-space-size=384",
            autorestart: true,
            watch: true,
            max_restarts: 20,
            restart_delay: 5000,
            env: {
                NODE_ENV: "production",
            },
        },
    ],
};
