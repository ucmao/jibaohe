from flask import Blueprint, jsonify
from datetime import datetime, date
from configs.general_constants import get_db_connection
from configs.logging_config import logger

# 创建蓝图
bp = Blueprint('report', __name__)


# 导出用户报告
@bp.route('/report-items/<string:openid>', methods=['GET'])
def generate_report_by_openid(openid):
    connection = None
    try:
        connection = get_db_connection()

        cursor = connection.execute("SELECT id FROM users WHERE openid = ?", (openid,))
        user = cursor.fetchone()
        if not user:
            logger.warning(f"User with openid {openid} not found.")
            return jsonify({'error': 'User not found'}), 404

        user_id = user['id']

        cursor = connection.execute("""
            SELECT * FROM items
            WHERE user_id = ? AND deleted_at IS NULL
        """, (user_id,))
        items = cursor.fetchall()

        today = date.today()
        report = {
            'assets': {
                'all': {'count': 0, 'amount': 0, 'days': 0, 'daily_avg': 0},
                'active': {'count': 0, 'amount': 0, 'days': 0, 'daily_avg': 0},
                'retired': {'count': 0, 'amount': 0, 'days': 0, 'daily_avg': 0},
                'favorite': {'count': 0, 'amount': 0, 'days': 0, 'daily_avg': 0}
            },
            'categories': {}
        }

        for item in items:
            purchase_price = item['purchase_price'] or 0
            retirement_price = item['retirement_price'] or 0

            # SQLite 日期以字符串存储，需转换
            purchase_date = date.fromisoformat(item['purchase_date']) if item['purchase_date'] else today
            retirement_date = date.fromisoformat(item['retirement_date']) if item['retirement_date'] else None

            price = purchase_price - retirement_price

            if item['use_count_value']:
                days = int(item['use_count_value'])
            elif item['daily_price']:
                days = int(float(purchase_price) / float(item['daily_price']))
            else:
                days = ((retirement_date or today) - purchase_date).days + 1

            report['assets']['all']['count'] += 1
            report['assets']['all']['amount'] += price
            report['assets']['all']['days'] += days

            if retirement_date:
                report['assets']['retired']['count'] += 1
                report['assets']['retired']['amount'] += price
                report['assets']['retired']['days'] += days
            else:
                report['assets']['active']['count'] += 1
                report['assets']['active']['amount'] += price
                report['assets']['active']['days'] += days

            if item['is_favorite']:
                report['assets']['favorite']['count'] += 1
                report['assets']['favorite']['amount'] += price
                report['assets']['favorite']['days'] += days

            category = item['category'] or "undefined"
            if category not in report['categories']:
                report['categories'][category] = {'count': 0, 'amount': 0, 'days': 0, 'daily_avg': 0}
            report['categories'][category]['count'] += 1
            report['categories'][category]['amount'] += price
            report['categories'][category]['days'] += days

        for key in report['assets']:
            if report['assets'][key]['days'] > 0:
                report['assets'][key]['daily_avg'] = round(
                    report['assets'][key]['amount'] / report['assets'][key]['days'], 2
                )

        for category in report['categories']:
            if report['categories'][category]['days'] > 0:
                report['categories'][category]['daily_avg'] = round(
                    report['categories'][category]['amount'] / report['categories'][category]['days'], 2
                )

        return jsonify(report)

    except Exception as e:
        logger.error(f"An error occurred while generating the report: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500
    finally:
        if connection:
            connection.close()
