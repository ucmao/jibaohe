from flask import Flask
from api.users.routes import bp as users_bp
from api.items.routes import bp as items_bp
from api.login.routes import bp as login_bp
from api.export.routes import bp as export_bp
from api.report.routes import bp as report_bp
from configs.logging_config import logger

app = Flask(__name__)


# 注册API蓝图
app.register_blueprint(users_bp, url_prefix='/api/users')
app.register_blueprint(items_bp, url_prefix='/api/items')
app.register_blueprint(export_bp, url_prefix='/api/export')
app.register_blueprint(report_bp, url_prefix='/api/report')
app.register_blueprint(login_bp, url_prefix='/api')


# 启动应用
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5007)
