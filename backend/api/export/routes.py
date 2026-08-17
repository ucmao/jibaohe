from flask import Blueprint, jsonify, send_file
import csv
import io
from configs.logging_config import logger
from configs.general_constants import get_db_connection

# 创建蓝图
bp = Blueprint('export', __name__)


# 导出用户物品为 CSV
@bp.route('/export-items/<string:openid>', methods=['GET'])
def export_items(openid):
    if not openid:
        return jsonify({'error': 'openid is required'}), 400

    connection = None
    try:
        connection = get_db_connection()

        cursor = connection.execute("SELECT id FROM users WHERE openid = ?", (openid,))
        user = cursor.fetchone()

        if not user:
            return jsonify({'error': 'User not found'}), 404

        user_id = user['id']

        cursor = connection.execute("""
            SELECT * FROM items
            WHERE user_id = ? AND deleted_at IS NULL
        """, (user_id,))
        items = cursor.fetchall()

        output = io.StringIO()
        writer = csv.writer(output)

        writer.writerow([
            '分类', '物品名称', '购买日期', '购买价格',
            '退役日期', '退役价格', '备注', '是否收藏', '使用次数', '日均价格',
            '创建时间', '更新时间'
        ])

        for item in items:
            writer.writerow([
                item['category'],
                item['item_name'],
                item['purchase_date'] or '',
                item['purchase_price'],
                item['retirement_date'] or '',
                item['retirement_price'],
                item['description'],
                item['is_favorite'],
                item['use_count_value'],
                item['daily_price'],
                item['created_at'],
                item['updated_at']
            ])

        output.seek(0)

        return send_file(
            io.BytesIO(output.getvalue().encode('utf-8')),
            mimetype='text/csv',
            as_attachment=True,
            download_name='items.csv'
        )
    except Exception as e:
        logger.error(f"Error in export_items: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if connection:
            connection.close()
