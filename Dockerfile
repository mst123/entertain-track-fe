# 构建阶段
FROM node:20-alpine AS build-stage
WORKDIR /app
RUN corepack enable
RUN corepack prepare pnpm@latest --activate
RUN npm config set registry https://registry.npmmirror.com

COPY .npmrc package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# 生产阶段
FROM nginx:alpine AS production-stage

# 拷贝构建结果
COPY --from=build-stage /app/dist /usr/share/nginx/html

# 拷贝 nginx 配置文件 代理总是失败，移到宿主机代理
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
