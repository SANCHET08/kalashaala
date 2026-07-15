from rest_framework.throttling import AnonRateThrottle


class LoginRateThrottle(AnonRateThrottle):
    scope = "login"

    def parse_rate(self, rate):
        if rate == "5/15min":
            return 5, 15 * 60
        return super().parse_rate(rate)

    def get_cache_key(self, request, view):
        username = ""
        try:
            username = (request.data.get("username") or "").strip().lower()
        except Exception:
            username = ""
        ident = self.get_ident(request)
        return self.cache_format % {
            "scope": self.scope,
            "ident": f"{ident}:{username}",
        }
