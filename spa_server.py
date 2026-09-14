import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

class SivagangaSPAHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        # Translate requested URL path to local filesystem path
        local_path = self.translate_path(self.path)

        # If an actual file exists, serve it normally
        if os.path.exists(local_path) and not os.path.isdir(local_path):
            return super().do_GET()

        # If a directory with index.html exists, serve it normally
        if os.path.isdir(local_path) and os.path.exists(os.path.join(local_path, 'index.html')):
            return super().do_GET()

        # SPA Fallback: Route all client-side routes (/chronicle, /level/..., etc.) to index.html with 200 OK
        self.path = '/index.html'
        return super().do_GET()

    def end_headers(self):
        # Ensure zero caching of HTML/JS/CSS during rapid play-testing
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

def run_server(port=8000):
    server_address = ('', port)
    httpd = ThreadingHTTPServer(server_address, SivagangaSPAHandler)
    httpd.daemon_threads = True
    print(f"[SPA Server] Serving SIVAGANGA on port {port} with HTML5 History fallback...")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        httpd.server_close()

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    run_server(port)
