from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from datetime import datetime

# In-memory storage for demo (would be MySQL in production)
PAGE_VIEWS = []

@csrf_exempt
def track_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            event = {
                'page': data.get('page', 'unknown'),
                'timestamp': datetime.now().isoformat()
            }
            PAGE_VIEWS.append(event)
            return JsonResponse({'status': 'success', 'event': event})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    return JsonResponse({'status': 'error', 'message': 'Invalid method'}, status=405)

def get_stats(request):
    # Aggregation logic
    stats = {}
    for view in PAGE_VIEWS:
        page = view['page']
        stats[page] = stats.get(page, 0) + 1
    
    return JsonResponse({
        'total_views': len(PAGE_VIEWS),
        'breakdown': stats
    })
