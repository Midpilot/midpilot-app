import { NextResponse } from 'next/server';
import { getOperatorProvider } from '../operatorProvider';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const operator = await getOperatorProvider();
    
    if (!operator.listTasks) {
      throw new Error('List tasks not supported by current operator');
    }

    const tasksData = await operator.listTasks(page, limit);
    
    return NextResponse.json({
      success: true,
      ...tasksData
    });
  } catch (error) {
    console.error('Error listing tasks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list tasks' },
      { status: 500 }
    );
  }
} 