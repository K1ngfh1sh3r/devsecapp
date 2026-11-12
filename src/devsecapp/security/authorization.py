"""Network-based role authorization for DevSecApp."""

from enum import Enum
from ipaddress import ip_address, ip_network

from fastapi import Depends, HTTPException, Request, status


class Role(str, Enum):
    IT = "IT"
    DEVELOPER = "Developer"


AUTHORIZED_NETWORKS = {
    ip_network("10.20.10.0/24"): Role.IT,
    ip_network("10.20.20.0/24"): Role.DEVELOPER,
}


def get_current_role(request: Request) -> Role:
    """Determine the user's role from the trusted Nginx client IP."""

    client_ip = request.headers.get("X-Real-IP")

    if not client_ip:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: client IP is missing",
        )

    try:
        address = ip_address(client_ip)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: invalid client IP",
        ) from None

    for network, role in AUTHORIZED_NETWORKS.items():
        if address in network:
            return role

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Access denied: unauthorized network",
    )


def require_role(*allowed_roles: Role):
    """Create a dependency that restricts access to specific roles."""

    def role_checker(
        current_role: Role = Depends(get_current_role),
    ) -> Role:
        if current_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: insufficient permissions",
            )

        return current_role

    return role_checker
