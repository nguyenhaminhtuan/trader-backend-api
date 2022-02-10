alias docker=podman
docker stop $SERVICE_NAME
docker system prune -f -a
docker pull asia.gcr.io/$PROJECT_ID/$SERVICE_NAME:$GITHUB_SHA
docker run --name $SERVICE_NAME -p ${{ secrets.PORT }}:${{ secrets.PORT }} \
    -e HOST=${{ secrets.HOST }} \
    -e PORT=${{ secrets.PORT }} \
    -e SESSION_COOKIE_SECRET=${{ secrets.SESSION_COOKIE_SECRET }} \
    -e DB_URI=${{ secrets.DB_URI }} \
    -e DB_USERNAME=${{ secrets.DB_USERNAME }} \
    -e DB_PASSWORD=${{ secrets.DB_PASSWORD}} \
    -e DB_NAME=${{ secrets.DB_NAME }} \
    -e STEAM_OPENID_IDENTIFIER=${{ secrets.STEAM_OPENID_IDENTIFIER }} \
    -e STEAM_OPENID_REALM=${{ secrets.STEAM_OPENID_REALM }} \
    -e STEAM_OPENID_REALM=${{ secrets.STEAM_OPENID_REALM }} \
    -e STEAM_API_URL=${{ secrets.STEAM_API_URL }} \
    -e STEAM_API_KEY=${{ secrets.STEAM_API_KEY }} \
    -e ETOP_API_URL=${{ secrets.ETOP_API_URL }} \
    -e ETOP_EMAIL=${{ secrets.ETOP_EMAIL }} \
    -e ETOP_PASSWORD=${{ secrets.ETOP_PASSWORD }} \
    -e ETOP_APP_ID=${{ secrets.ETOP_APP_ID }} \
    -e ETOP_HOT_VERSION=${{ secrets.ETOP_HOT_VERSION }} \
    -d --restart always asia.gcr.io/$PROJECT_ID/$SERVICE_NAME:$GITHUB_SHA