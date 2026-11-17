from app.core.config import normalizar_url_banco


def test_url_da_neon_passa_a_usar_o_driver_psycopg():
    # A Neon (pela Vercel) entrega a URL com "postgres://" ou "postgresql://".
    assert normalizar_url_banco('postgres://u:s@host/db?sslmode=require') == 'postgresql+psycopg://u:s@host/db?sslmode=require'
    assert normalizar_url_banco('postgresql://u:s@host/db') == 'postgresql+psycopg://u:s@host/db'


def test_outras_urls_ficam_como_estao():
    assert normalizar_url_banco('sqlite:///./fila_virtual.db') == 'sqlite:///./fila_virtual.db'
    url_docker = 'postgresql+psycopg://fila:fila@db:5432/fila_virtual'
    assert normalizar_url_banco(url_docker) == url_docker
