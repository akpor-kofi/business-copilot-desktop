# Define paths
WEBAPP_DIR=../business-copilot-webapp
FRONTEND_DIR=frontend
APP_CONFIG=$(WEBAPP_DIR)/app.json
ENV_FILE=$(WEBAPP_DIR)/.env

# Backup the original ENV file
ENV_BACKUP=$(WEBAPP_DIR)/.env.backup

# Update app.json build output
update_app_output:
	@echo "Updating Expo build mode to: $(BUILD_MODE)..."
	@jq '.expo.web.output = "single"' $(APP_CONFIG) > $(APP_CONFIG).tmp && mv $(APP_CONFIG).tmp $(APP_CONFIG)

# Reset app.json build output back to static
reset_app_output:
	@echo "Resetting Expo build mode to 'static'..."
	@jq '.expo.web.output = "static"' $(APP_CONFIG) > $(APP_CONFIG).tmp && mv $(APP_CONFIG).tmp $(APP_CONFIG)

# Backup the original .env and update EXPO_PUBLIC_ENV to local
update_env_file:
	@echo "Backing up current .env..."
	cp $(ENV_FILE) $(ENV_BACKUP)
	@echo "Setting EXPO_PUBLIC_ENV to local..."
	@sed -i '' 's/EXPO_PUBLIC_ENV=.*/EXPO_PUBLIC_ENV=local/' $(ENV_FILE)

# Reset .env back to original
reset_env_file:
	@echo "Restoring original .env..."
	cp $(ENV_BACKUP) $(ENV_FILE)
	rm -f $(ENV_BACKUP)

# Build expo app and copy dist folder
build_expo: update_app_output update_env_file
	@echo "Building expo app..."
	cd $(WEBAPP_DIR) && npx expo export --platform web
	@echo "Removing old dist folder..."
	rm -rf $(FRONTEND_DIR)/dist
	@echo "Copying new dist folder to frontend..."
	cp -r $(WEBAPP_DIR)/dist $(FRONTEND_DIR)
	@echo "Removing old drizzle folder..."
	rm -rf $(FRONTEND_DIR)/drizzle
	@echo "Copying new drizzle folder to frontend..."
	cp -r $(WEBAPP_DIR)/drizzle $(FRONTEND_DIR)

clear_metro_cache:
	@rm -rf $(TMPDIR)/metro-cache

# Wails development build (requires expo build first)
dev: clear_metro_cache build_expo
	@echo "Running Wails dev..."
	wails build -devtools
	@$(MAKE) reset_app_output reset_env_file  # Reset both app.json and .env after dev

# Wails production build (requires expo build first)
build: build_expo
	@echo "Building Wails app..."
	wails build
	@$(MAKE) reset_app_output reset_env_file

wails_build_and_publish:
	@echo "Building Wails project..."
	wails build
	@echo "Packaging Wails main functions..."
	bash ./scripts/package-wails-main.sh

