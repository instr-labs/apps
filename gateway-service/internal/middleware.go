package internal

import (
	"errors"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func isAllowedOrigin(origin, allowlist string) bool {
	origin = strings.TrimSpace(origin)
	if origin == "" {
		return false
	}
	for _, a := range strings.Split(allowlist, ",") {
		if strings.TrimSpace(a) == origin {
			return true
		}
	}
	return false
}

func SetupMiddleware(app *fiber.App, cfg *Config) {
	// CORS
	app.Use(cors.New(cors.Config{
		AllowOrigins:     cfg.Origins,
		AllowMethods:     "GET, POST, PUT, DELETE, OPTIONS",
		AllowHeaders:     "Origin, Content-Type, X-Authenticated, X-User-Id, X-User-Roles, X-User-Refresh, X-Origin",
		AllowCredentials: true,
	}))

	// CSRF protection
	app.Use(func(c *fiber.Ctx) error {
		method := c.Method()
		if method == fiber.MethodOptions || method == fiber.MethodGet {
			return c.Next()
		}

		if method == fiber.MethodPost || method == fiber.MethodPut || method == fiber.MethodPatch || method == fiber.MethodDelete {
			origin := c.Get("Origin")
			if !isAllowedOrigin(origin, cfg.Origins) {
				return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
					"message": "FORBIDDEN_ORIGIN",
					"errors":  nil,
					"data":    nil,
				})
			}
		}

		return c.Next()
	})

	// AUTH
	app.Use(func(c *fiber.Ctx) error {
		origin := c.Get("Origin")
		accessToken := c.Cookies("AccessToken")
		refreshToken := c.Cookies("RefreshToken")

		c.Request().Header.Del("Cookie")
		c.Request().Header.Del("X-Authenticated")
		c.Request().Header.Del("X-User-Id")
		c.Request().Header.Del("X-User-Roles")
		c.Request().Header.Del("X-Origin")

		if accessToken != "" {
			if info, err := ExtractTokenInfo(cfg.JWTSecret, accessToken); err == nil {
				c.Request().Header.Set("X-Authenticated", "true")
				c.Request().Header.Set("X-User-Id", info.UserID)
				c.Request().Header.Set("X-User-Roles", strings.Join(info.Roles, ","))
				c.Request().Header.Set("X-User-Refresh", refreshToken)
				c.Request().Header.Set("X-Origin", origin)
			} else {
				if errors.Is(err, ErrTokenExpired) {
					return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
						"message": err.Error(),
						"errors":  nil,
						"data":    nil,
					})
				}

				if errors.Is(err, ErrTokenInvalid) {
					c.ClearCookie("AccessToken")
					c.ClearCookie("RefreshToken")
					return c.Redirect("/login", 302)
				}

				c.Request().Header.Set("X-Authenticated", "false")
			}
		}

		if accessToken == "" && refreshToken != "" && c.Path() != "/auth/refresh" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"message": ErrTokenExpired.Error(),
				"errors":  nil,
				"data":    nil,
			})
		}

		c.Request().Header.Set("X-Gateway", "true")

		return c.Next()
	})
}
