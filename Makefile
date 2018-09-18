define print
	@echo "\033[0;35m### $(1) ...\033[0m"
endef

all: test

test: ;$(call print,Running the tests); \
	docker kill monga 2>/dev/null; \
	trap "docker kill monga" EXIT; \
	docker run --name monga -d --rm -p 27017:27017 mongo && \
	MONGODB_URL=mongodb://localhost:27017/test npm t

.PHONY: all install clean test
