# 构建阶段
FROM node:20-alpine as build-stage
WORKDIR /app
RUN corepack enable
RUN corepack prepare pnpm@latest --activate
RUN npm config set registry https://registry.npmmirror.com

COPY .npmrc package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# 生产阶段
FROM nginx:alpine as production-stage

# 拷贝构建结果
COPY --from=build-stage /app/dist /usr/share/nginx/html
# 拷贝 nginx 配置文件
COPY nginx.conf /etc/nginx/nginx.conf

# 验证 nginx 配置是否正确
RUN nginx -t

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
