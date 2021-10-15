# ====================================================Help============================================================
# code found here : https://marmelab.com/blog/2016/02/29/auto-documented-makefile.html

help:
	@grep -E '(^[a-zA-Z_-]+:.*?##.*$$)|(^##)' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[32m%-20s\033[0m %s\n", $$1, $$2}' | sed -e 's/\[32m##/[33m/'

# ====================================================================================================================

default:	build 

requirements : # Display the requirements
	bash builders/requirements.bash

nginx: ## Install Nginx and Quiche to apply to right patchs 
	bash builders/nginx.bash

build: nginx ## Make all the process in order to build the project /!\ Please install the requirement BEFORE build it /!\